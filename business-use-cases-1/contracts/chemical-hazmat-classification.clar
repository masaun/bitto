(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))

(define-map hazmat-classifications
  { chemical-id: (string-ascii 50) }
  {
    un-number: (string-ascii 20),
    hazard-class: (string-ascii 50),
    packing-group: (string-ascii 10),
    emergency-contact: (string-ascii 100),
    classified-by: principal,
    classified-at: uint,
    is-hazardous: bool
  }
)

(define-public (classify-hazmat (chemical-id (string-ascii 50)) (un-number (string-ascii 20)) (hazard-class (string-ascii 50)) (packing-group (string-ascii 10)) (emergency-contact (string-ascii 100)))
  (begin
    (asserts! (is-none (map-get? hazmat-classifications { chemical-id: chemical-id })) err-already-exists)
    (ok (map-set hazmat-classifications
      { chemical-id: chemical-id }
      {
        un-number: un-number,
        hazard-class: hazard-class,
        packing-group: packing-group,
        emergency-contact: emergency-contact,
        classified-by: tx-sender,
        classified-at: stacks-block-height,
        is-hazardous: true
      }
    ))
  )
)

(define-public (update-emergency-contact (chemical-id (string-ascii 50)) (emergency-contact (string-ascii 100)))
  (let ((classification (unwrap! (map-get? hazmat-classifications { chemical-id: chemical-id }) err-not-found)))
    (ok (map-set hazmat-classifications
      { chemical-id: chemical-id }
      (merge classification { emergency-contact: emergency-contact })
    ))
  )
)

(define-read-only (get-hazmat-classification (chemical-id (string-ascii 50)))
  (map-get? hazmat-classifications { chemical-id: chemical-id })
)
