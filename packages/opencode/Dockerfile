FROM alpine AS base

# Disable the runtime transpiler cache by default inside Docker containers.
# On ephemeral containers, the cache is not useful
ARG BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=${BUN_RUNTIME_TRANSPILER_CACHE_PATH}
RUN apk add libgcc libstdc++ ripgrep

FROM base AS build-amd64
# auracode_change start
COPY dist/@auracode/cli-linux-x64-baseline-musl/bin/aura dist/@auracode/cli-linux-x64-baseline-musl/bin/bwrap /usr/local/bin/
COPY dist/@auracode/cli-linux-x64-baseline-musl/bin/licenses /usr/local/share/licenses/aura
# auracode_change end

FROM base AS build-arm64
# auracode_change start
COPY dist/@auracode/cli-linux-arm64-musl/bin/aura dist/@auracode/cli-linux-arm64-musl/bin/bwrap /usr/local/bin/
COPY dist/@auracode/cli-linux-arm64-musl/bin/licenses /usr/local/share/licenses/aura
# auracode_change end

ARG TARGETARCH
# auracode_change start
FROM build-${TARGETARCH} AS openshell
RUN aura --version
ENTRYPOINT ["aura"]
COPY script/auracode/openshell/aura.json /etc/aura/aura.json
ENV AURA_DISABLE_MODELS_FETCH=1 AURA_DISABLE_SESSION_INGEST=1 AURA_DISABLE_PRESENCE=1
# auracode_change end

FROM build-${TARGETARCH}
RUN aura --version
ENTRYPOINT ["aura"]
