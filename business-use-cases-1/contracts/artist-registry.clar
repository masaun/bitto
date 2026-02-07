(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map artists 
  principal 
  {
    name: (string-ascii 100),
    verified: bool,
    registered-at: uint
  }
)

(define-map artist-metadata
  principal
  {
    bio: (string-utf8 500),
    genre: (string-ascii 50),
    country: (string-ascii 3)
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-artist (artist principal))
  (ok (map-get? artists artist))
)

(define-read-only (get-artist-metadata (artist principal))
  (ok (map-get? artist-metadata artist))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-artist (name (string-ascii 100)))
  (let ((artist tx-sender))
    (asserts! (is-none (map-get? artists artist)) ERR_ALREADY_EXISTS)
    (ok (map-set artists artist {
      name: name,
      verified: false,
      registered-at: stacks-block-height
    }))
  )
)

(define-public (verify-artist (artist principal))
  (let ((artist-data (unwrap! (map-get? artists artist) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set artists artist (merge artist-data { verified: true })))
  )
)

(define-public (update-metadata (bio (string-utf8 500)) (genre (string-ascii 50)) (country (string-ascii 3)))
  (begin
    (asserts! (is-some (map-get? artists tx-sender)) ERR_NOT_FOUND)
    (ok (map-set artist-metadata tx-sender {
      bio: bio,
      genre: genre,
      country: country
    }))
  )
)
