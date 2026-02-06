(define-map cohorts
  { cohort-id: uint }
  {
    program-id: uint,
    cohort-name: (string-ascii 100),
    start-date: uint,
    end-date: uint,
    max-startups: uint,
    current-startups: uint,
    status: (string-ascii 20)
  }
)

(define-data-var cohort-nonce uint u0)

(define-public (create-cohort (program uint) (name (string-ascii 100)) (start uint) (end uint) (max-startups uint))
  (let ((cohort-id (+ (var-get cohort-nonce) u1)))
    (map-set cohorts
      { cohort-id: cohort-id }
      {
        program-id: program,
        cohort-name: name,
        start-date: start,
        end-date: end,
        max-startups: max-startups,
        current-startups: u0,
        status: "open"
      }
    )
    (var-set cohort-nonce cohort-id)
    (ok cohort-id)
  )
)

(define-public (add-startup-to-cohort (cohort-id uint))
  (match (map-get? cohorts { cohort-id: cohort-id })
    cohort (ok (map-set cohorts { cohort-id: cohort-id } (merge cohort { current-startups: (+ (get current-startups cohort) u1) })))
    (err u404)
  )
)

(define-read-only (get-cohort (cohort-id uint))
  (map-get? cohorts { cohort-id: cohort-id })
)
