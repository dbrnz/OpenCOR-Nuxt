################################################################################

# Use `bun` to build the application
FROM oven/bun:canary-alpine

WORKDIR /

# Get the applications's sources and install it
RUN apk add --no-cache bash git; \
    git clone  --depth 1 https://github.com/dbrnz/OpenCOR-Nuxt.git OpenCOR; \
    cd OpenCOR; \
    bun install --ignore-scripts --no-progress; \
    bun scripts/libopencor.install.ts

################################################################################
