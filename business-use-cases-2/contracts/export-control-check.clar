(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map export-controls {item-id: uint, destination: (string-ascii 32)} {approved: bool, control-category: (string-ascii 64)})

(define-public (check-export-control (item-id uint) (destination (string-ascii 32)) (control-category (string-ascii 64)))
  (ok (map-set export-controls {item-id: item-id, destination: destination} {approved: false, control-category: control-category})))

(define-read-only (get-export-control (item-id uint) (destination (string-ascii 32)))
  (ok (map-get? export-controls {item-id: item-id, destination: destination})))
