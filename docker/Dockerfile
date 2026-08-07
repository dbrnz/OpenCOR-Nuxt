################################################################################

# Use `bun` to build the application
FROM oven/bun:canary-alpine

WORKDIR /build

# Install `git` and get the applications's sources
RUN apk add --no-cache bash git; \
    git clone --depth 1 https://github.com/dbrnz/OpenCOR-Nuxt.git ModelBuilder

# Install and build
RUN \
    cd ModelBuilder; \
    bun install --ignore-scripts --no-progress; \
    bun scripts/libopencor.install.ts; \
    bun run build; \
    mv .output /ModelBuilder

# Remove build directory
WORKDIR /
RUN rm -rf /build

################################################################################
