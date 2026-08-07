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
