# ── Build BCHD from source ──────────────────────────────────────────
FROM golang:1.23-bookworm AS build

ARG BCHD_VERSION=v0.21.1

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --depth 1 --branch ${BCHD_VERSION} https://github.com/gcash/bchd.git

WORKDIR /build/bchd
RUN CGO_ENABLED=0 go build -o /usr/local/bin/bchd . && \
    CGO_ENABLED=0 go build -o /usr/local/bin/bchctl ./cmd/bchctl && \
    CGO_ENABLED=0 go build -o /usr/local/bin/gencerts ./cmd/gencerts

# ── Runtime ─────────────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/local/bin/bchd /usr/local/bin/
COPY --from=build /usr/local/bin/bchctl /usr/local/bin/
COPY --from=build /usr/local/bin/gencerts /usr/local/bin/

RUN mkdir -p /data
VOLUME /data
EXPOSE 8332 8333 8335

ENTRYPOINT ["bchd"]
