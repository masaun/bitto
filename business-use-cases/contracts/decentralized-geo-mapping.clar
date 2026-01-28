(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map geo-locations
  {location-id: uint}
  {
    latitude: int,
    longitude: int,
    altitude: int,
    name: (string-ascii 128),
    location-type: (string-ascii 64),
    verified-by: principal,
    timestamp: uint,
    metadata-hash: (buff 32)
  }
)

(define-map geo-zones
  {zone-id: uint}
  {
    name: (string-ascii 128),
    boundary-hash: (buff 32),
    zone-type: (string-ascii 64),
    population: uint,
    created-by: principal,
    created-at: uint
  }
)

(define-data-var location-nonce uint u0)
(define-data-var zone-nonce uint u0)

(define-read-only (get-location (location-id uint))
  (map-get? geo-locations {location-id: location-id})
)

(define-read-only (get-zone (zone-id uint))
  (map-get? geo-zones {zone-id: zone-id})
)

(define-public (register-location
  (latitude int)
  (longitude int)
  (altitude int)
  (name (string-ascii 128))
  (location-type (string-ascii 64))
  (metadata-hash (buff 32))
)
  (let ((location-id (var-get location-nonce)))
    (map-set geo-locations {location-id: location-id}
      {
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        name: name,
        location-type: location-type,
        verified-by: tx-sender,
        timestamp: stacks-block-height,
        metadata-hash: metadata-hash
      }
    )
    (var-set location-nonce (+ location-id u1))
    (ok location-id)
  )
)

(define-public (create-zone
  (name (string-ascii 128))
  (boundary-hash (buff 32))
  (zone-type (string-ascii 64))
  (population uint)
)
  (let ((zone-id (var-get zone-nonce)))
    (map-set geo-zones {zone-id: zone-id}
      {
        name: name,
        boundary-hash: boundary-hash,
        zone-type: zone-type,
        population: population,
        created-by: tx-sender,
        created-at: stacks-block-height
      }
    )
    (var-set zone-nonce (+ zone-id u1))
    (ok zone-id)
  )
)
