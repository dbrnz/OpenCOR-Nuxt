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

//==============================================================================

export class OmexArchive {
    #archive: JSZip  | undefined = undefined
    #cellmlLocation: string | undefined = undefined
    #imageLocation: string | undefined = undefined
    #formatFromLocation: Map<string, OMEX_FORMAT> = new Map()      // location --> format
    #locationFromFormat: Map<OMEX_FORMAT, string> = new Map()      // format --> location

    #imageIdLabelMap: Map<string, string> = new Map()
    #imageIdModelMap: Map<string, string> = new Map()
    #modelIdImageMap: Map<string, string> = new Map()
    #modelIdVariableMap: Map<string, string> = new Map()
    #modelVariableIdMap: Map<string, string> = new Map()

    #rdfStore = new RdfStore()
    #uri: string = ''

    async open(uri: string, data: Uint8Array) {
        this.#uri = uri
        const jsZip = JSZip()
        try {
            this.#archive = await jsZip.loadAsync(data)
            await this.#loadManifest()
            await this.#findModelVariables()
            this.#mapModelToImageId()

        } catch (error: unknown) {
            console.error('Open OMEX:', error)
            throw error     // So caller can catch and exit
        }
    }

    async getModelImageData(): Promise<string|undefined> {
        if (this.#imageLocation && this.#getFormat(this.#imageLocation) === OMEX_FORMAT.svg) {
            return await this.#getLocationData(this.#imageLocation) as Promise<string>
        }
    }

    getViewerAnnotation() {
        const result: Record<string, Record<string, string>> = {}
        for (const [imageId, varId] of this.#imageIdModelMap.entries()) {
            const variable = this.#modelIdVariableMap.get(varId)
            if (variable) {
                result[imageId] = {
                    variable
                }
                const label = this.#imageIdLabelMap.get(imageId)
                if (label) {
                    result[imageId].label = label
                }
            }
        }
        return result
    }

    async #findModelVariables() {
        if (this.#cellmlLocation) {
            const cellmlData: string = await this.#getLocationData(this.#cellmlLocation) as string
            if (cellmlData) {
                const parser = new DOMParser()
                const cellml = parser.parseFromString(cellmlData, 'text/xml')
                const modelElement = cellml.documentElement
                const idAttribute = modelElement.getAttribute('xmlns')?.endsWith('2.0#') ? 'id' : 'cmeta:id'
                for (const element of modelElement.children) {
                    if (element.tagName === 'component') {
                        const componentName = element.getAttribute('name')
                        for (const childElement of element.children) {
                            if (childElement.tagName === 'variable') {
                                const varName = `${componentName}/${childElement.getAttribute('name')}`
                                const varId = childElement.getAttribute(idAttribute)
                                if (varId) {
                                    this.#modelIdVariableMap.set(varId, varName)
                                    this.#modelVariableIdMap.set(varName, varId)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    #getFormat(location: string): OMEX_FORMAT|undefined {
        return this.#formatFromLocation.get(location)
    }

    #getLocation(format: OMEX_FORMAT): string|undefined {
        return this.#locationFromFormat.get(format)
    }

    async #getLocationData(location: string, type: OutputType='string'): Promise<unknown> {
        const dataFile = this.#archive?.file(location)
        return dataFile?.async(type)
    }

    async #loadManifest() {
        const manifestFile: JSZipObject|null = this.#archive?.file('manifest.xml') || null
        const manifestData = await manifestFile?.async('string')
        if (manifestData) {
            const parser = new DOMParser()
            const manifest = parser.parseFromString(manifestData, 'text/xml')
            if (manifest.documentElement.nodeName === 'omexManifest') {
                for (const element of manifest.documentElement.children) {
                    if (element.tagName === 'content') {
                        const format = element.getAttribute('format') as OMEX_FORMAT
                        const location = element.getAttribute('location')
                        if (format && location) {
                            this.#formatFromLocation.set(location, format)
                            this.#locationFromFormat.set(format, location)
                        }
                    }
                }
                if (this.#locationFromFormat.get(OMEX_FORMAT.manifest) === '.') {
                    this.#cellmlLocation = this.#getLocation(OMEX_FORMAT.cellml)
                    await this.#loadMetadata()
                    return
                }
            }
        }
        throw new Error('Invalid OMEX archive')
    }

    async #loadMetadata() {
        const metadataLocation = this.#getLocation(OMEX_FORMAT.metadata)
        if (metadataLocation) {
            const metadata = (await this.#getLocationData(metadataLocation)) as string
            this.#rdfStore.load(this.#uri, metadata)
        }
    }

    #mapModelToImageId() {
        if (this.#cellmlLocation) {
            const result = this.#rdfStore.query(`
                PREFIX bqmodel: <http://biomodels.net/model-qualifiers/>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                SELECT ?image
                WHERE {
                    <${this.#uri}${this.#cellmlLocation}> bqmodel:isDescribedBy ?image .
                }
            `)
            if (result) {
                this.#imageLocation = result[0]?.get('image')?.value.slice(this.#uri.length)
            }

            if (this.#imageLocation) {
                const modelPrefixLength = `${this.#uri}${this.#cellmlLocation}#`.length
                const imagePrefixLength = `${this.#uri}${this.#imageLocation}#`.length

                this.#rdfStore.query(`
                    PREFIX bqmodel: <http://biomodels.net/model-qualifiers/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                    SELECT ?modelId ?imageId ?label
                    WHERE {
                        ?modelId bqmodel:isDerivedFrom ?imageId .
                        OPTIONAL { ?modelId rdfs:label ?label }
                    }
                `).forEach((r) => {
                    const modelId = r.get('modelId')?.value.slice(modelPrefixLength) as string
                    const imageId = r.get('imageId')?.value.slice(imagePrefixLength)
                    const label = r.get('label')?.value

                    if (imageId) {
                        this.#imageIdModelMap.set(imageId, modelId)
                        this.#modelIdImageMap.set(modelId, imageId)
                        if (label) {
                            this.#imageIdLabelMap.set(imageId, label)
                        }
                    }
                })
            }
        }
    }
}

//==============================================================================
