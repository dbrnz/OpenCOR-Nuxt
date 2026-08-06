//==============================================================================

import type { JSZipObject, OutputType } from 'jszip'
import JSZip from 'jszip'
import { RdfStore } from "~/metadata"

//==============================================================================

export enum OMEX_FORMAT {
    cellml = 'http://identifiers.org/combine.specifications/cellml',
    manifest = 'http://identifiers.org/combine.specifications/omex',
    metadata = 'http://identifiers.org/combine.specifications/omex-metadata',
    svg = 'image/svg+xml'
}

export const OMEX_BASE_URI = 'http://celldl.org/omex/'

//==============================================================================

export class OmexArchive {
    #archive: JSZip  |undefined = undefined
    #formatFromLocation: Map<string, OMEX_FORMAT> = new Map()      // location --> format
    #locationFromFormat: Map<OMEX_FORMAT, string> = new Map()      // format --> location
    #rdfStore = new RdfStore()

    async open(data: Uint8Array) {
        const jsZip = JSZip()
        try {
            this.#archive = await jsZip.loadAsync(data)
            const manifestFile: JSZipObject|null = this.#archive.file('manifest.xml')
            const manifestData = await manifestFile?.async('string')
            if (manifestData) {
                const parser = new DOMParser()
                const manifest = parser.parseFromString(manifestData, 'text/xml')
                if (manifest.documentElement.nodeName === 'omexManifest') {
                    for (const element of manifest.getElementsByTagName('content')) {
                        const format = element.getAttribute('format') as OMEX_FORMAT
                        const location = element.getAttribute('location')
                        if (format && location) {
                            this.#formatFromLocation.set(location, format)
                            this.#locationFromFormat.set(format, location)
                        }
                    }
                    if (this.#locationFromFormat.get(OMEX_FORMAT.manifest) === '.') {
                        const metadataLocation = this.location(OMEX_FORMAT.metadata)
                        if (metadataLocation) {
                            const metadata = (await this.getLocationData(metadataLocation)) as string
                            this.#rdfStore.load(OMEX_BASE_URI, metadata)
                        }
                    }
                }
            }
        } catch (error: unknown) {
            console.error('Open OMEX: ', error)
            throw error     // So caller can catch and exit
        }
    }

    format(location: string): OMEX_FORMAT|undefined {
        return this.#formatFromLocation.get(location)
    }

    async getModelImage(): Promise<string|undefined> {
        const modelLocation = this.location(OMEX_FORMAT.cellml)
        if (modelLocation) {
            const result = this.#rdfStore.query(`
                PREFIX bqmodel: <http://biomodels.net/model-qualifiers/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                SELECT ?image
                WHERE {
                    <${OMEX_BASE_URI}${modelLocation}> bqmodel:isDescribedBy ?image .
                }
            `)
            if (result) {
                const imageLocation = result[0]?.get('image')?.value.slice(OMEX_BASE_URI.length)
                if (imageLocation && this.format(imageLocation) === OMEX_FORMAT.svg) {
                    return await this.getLocationData(imageLocation) as Promise<string>
                }
            }
        }
    }

    async getLocationData(location: string, type: OutputType='string'): Promise<unknown> {
        const dataFile = this.#archive?.file(location)
        const data = dataFile?.async(type)

        return data
    }

    location(format: OMEX_FORMAT): string|undefined {
        return this.#locationFromFormat.get(format)
    }

    queryMetadata(sparql: string) {
        return this.#rdfStore.query(sparql)
    }
}

//==============================================================================
