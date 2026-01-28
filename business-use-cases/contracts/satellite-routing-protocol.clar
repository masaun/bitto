(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map routes
  {route-id: uint}
  {
    source-satellite: uint,
    destination-satellite: uint,
    latency-ms: uint,
    bandwidth-gbps: uint,
    hop-count: uint,
    active: bool,
    last-updated: uint
  }
)

(define-map routing-table
  {satellite-id: uint, destination-id: uint}
  {
    next-hop: uint,
    cost: uint,
    metric: uint
  }
)

(define-map link-status
  {satellite-a: uint, satellite-b: uint}
  {
    operational: bool,
    bandwidth-available: uint,
    last-heartbeat: uint
  }
)

(define-data-var route-nonce uint u0)

(define-read-only (get-route (route-id uint))
  (map-get? routes {route-id: route-id})
)

(define-read-only (get-routing-entry (satellite-id uint) (destination-id uint))
  (map-get? routing-table {satellite-id: satellite-id, destination-id: destination-id})
)

(define-read-only (get-link-status (satellite-a uint) (satellite-b uint))
  (map-get? link-status {satellite-a: satellite-a, satellite-b: satellite-b})
)

(define-public (establish-route
  (source-satellite uint)
  (destination-satellite uint)
  (latency-ms uint)
  (bandwidth-gbps uint)
  (hop-count uint)
)
  (let ((route-id (var-get route-nonce)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set routes {route-id: route-id}
      {
        source-satellite: source-satellite,
        destination-satellite: destination-satellite,
        latency-ms: latency-ms,
        bandwidth-gbps: bandwidth-gbps,
        hop-count: hop-count,
        active: true,
        last-updated: stacks-block-height
      }
    )
    (var-set route-nonce (+ route-id u1))
    (ok route-id)
  )
)

(define-public (update-routing-table
  (satellite-id uint)
  (destination-id uint)
  (next-hop uint)
  (cost uint)
  (metric uint)
)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set routing-table {satellite-id: satellite-id, destination-id: destination-id}
      {next-hop: next-hop, cost: cost, metric: metric}
    ))
  )
)

(define-public (update-link-status
  (satellite-a uint)
  (satellite-b uint)
  (operational bool)
  (bandwidth-available uint)
)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set link-status {satellite-a: satellite-a, satellite-b: satellite-b}
      {
        operational: operational,
        bandwidth-available: bandwidth-available,
        last-heartbeat: stacks-block-height
      }
    ))
  )
)

(define-public (deactivate-route (route-id uint))
  (let ((route (unwrap! (map-get? routes {route-id: route-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set routes {route-id: route-id}
      (merge route {active: false})
    ))
  )
)
