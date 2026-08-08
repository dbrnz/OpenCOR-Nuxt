## Building

```
docker buildx build --no-cache -f docker/Dockerfile -t model-builder:latest
```


## Installing

```
docker pull dbrnz/model-builder:latest
```


## Running

```
docker run -d -p 80:3000 dbrnz/model-builder:latest
```

## Using

Open http://localhost in a browser.


## Windows

### Installing and starting Docker:
* Check virtualisation is enabled in the machine's BIOS.
* Download and install Docker Desktop from [here](https://docs.docker.com/desktop/setup/install/windows-install/)
* Reboot Windows.
* Start Docker Desktop using its desktop icon.
* Skip registration (or register).
* Wait for the engine to start (it may take a minute or so).

### Installing the ModelBuilder image:
* Open the `Images` panel from the sidebar and click `Search images to run` button.
* Type `dbrnz/model-builder` and click `Pull` on the displayed row.
* The `Escape` key will close the dialog.

### Creating a new container for the image:
* Open the `Images` panel, select the `dbrnz/model-builder` entry, and click the triangle icon in `Actions`. Then use `Optional settings` to set the name (recommend `ModelBuilder`, but optional) and the port (recommend `3000`, a value is necessary) , and then click `Run`.
* The `Containers` panel will show the running container. Click on the Port link, e.g. [3000/3000](http://localhost:3000), to open a browser window running OpenCOR.

### Starting and stopping the container:
* Once a container for the image has been created above and can be controlled using the `Containers` panel.

### Updating the ModelBuilder image:
* First make sure the container is stopped in the `Containers` panel.
* Using the `Images` panel, select the `dbrnz/model-builder` entry and click the 3-vertical-dots icon in `Actions` and then `Pull`. This will pull down the latest `ModelViewer` image.
