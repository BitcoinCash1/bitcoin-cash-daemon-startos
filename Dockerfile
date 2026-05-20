# ── Runtime ─────────────────────────────────────────────────────────
FROM debian:stable-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        netcat-openbsd \
        e2fsprogs \
        stunnel4 && \
    rm -rf /var/lib/apt/lists/*

# bchd binaries (pre-built, BFUpgrade9-patched — see Dockerfile.binary)
COPY --from=ghcr.io/bitcoincash1/bchd-binary:latest /usr/local/bin/bchd /usr/local/bin/
COPY --from=ghcr.io/bitcoincash1/bchd-binary:latest /usr/local/bin/bchctl /usr/local/bin/
COPY --from=ghcr.io/bitcoincash1/bchd-binary:latest /usr/local/bin/gencerts /usr/local/bin/

RUN mkdir -p /data
VOLUME /data
EXPOSE 8332 8333 8334 8335

ENTRYPOINT ["bchd"]
