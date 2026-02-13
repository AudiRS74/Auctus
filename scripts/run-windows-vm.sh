#!/bin/bash

# Remove existing container if it exists
docker rm -f tiny10 2>/dev/null || true

# Check for KVM support
if [ -e /dev/kvm ]; then
  echo "KVM acceleration is available."
  KVM_ARGS="--device=/dev/kvm"
else
  echo "Warning: /dev/kvm not found. Running with KVM acceleration disabled (KVM=N)."
  KVM_ARGS="-e KVM=N"
fi

docker run -d --name tiny10 \
  -p 8006:8006 \
  --device=/dev/net/tun \
  --cap-add NET_ADMIN \
  $KVM_ARGS \
  -e VERSION="11" \
  -e RAM_SIZE="3G" \
  -e CPU_CORES="2" \
  -v tiny10-data:/storage \
  --stop-timeout 120 \
  --restart unless-stopped \
  dockurr/windows:latest
