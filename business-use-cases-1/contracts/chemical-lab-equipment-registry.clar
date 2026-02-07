(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))

(define-map lab-equipment
  { equipment-id: (string-ascii 50) }
  {
    equipment-name: (string-ascii 100),
    equipment-type: (string-ascii 50),
    serial-number: (string-ascii 50),
    location: (string-ascii 100),
    last-calibration: uint,
    next-calibration: uint,
    registered-by: principal,
    is-operational: bool
  }
)

(define-public (register-equipment (equipment-id (string-ascii 50)) (equipment-name (string-ascii 100)) (equipment-type (string-ascii 50)) (serial-number (string-ascii 50)) (location (string-ascii 100)))
  (begin
    (asserts! (is-none (map-get? lab-equipment { equipment-id: equipment-id })) err-already-exists)
    (ok (map-set lab-equipment
      { equipment-id: equipment-id }
      {
        equipment-name: equipment-name,
        equipment-type: equipment-type,
        serial-number: serial-number,
        location: location,
        last-calibration: stacks-block-height,
        next-calibration: (+ stacks-block-height u5000),
        registered-by: tx-sender,
        is-operational: true
      }
    ))
  )
)

(define-public (update-calibration (equipment-id (string-ascii 50)))
  (let ((equipment (unwrap! (map-get? lab-equipment { equipment-id: equipment-id }) err-not-found)))
    (ok (map-set lab-equipment
      { equipment-id: equipment-id }
      (merge equipment { 
        last-calibration: stacks-block-height,
        next-calibration: (+ stacks-block-height u5000)
      })
    ))
  )
)

(define-read-only (get-equipment (equipment-id (string-ascii 50)))
  (map-get? lab-equipment { equipment-id: equipment-id })
)
