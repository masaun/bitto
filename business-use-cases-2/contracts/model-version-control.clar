(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map model-versions {model-id: uint, version: uint} {hash: (buff 32), timestamp: uint, active: bool})

(define-public (create-version (model-id uint) (version uint) (hash (buff 32)))
  (begin
    (asserts! (> version u0) ERR-INVALID-PARAMETER)
    (ok (map-set model-versions {model-id: model-id, version: version} {hash: hash, timestamp: stacks-block-height, active: true}))))

(define-public (deactivate-version (model-id uint) (version uint))
  (let ((ver (unwrap! (map-get? model-versions {model-id: model-id, version: version}) ERR-NOT-FOUND)))
    (ok (map-set model-versions {model-id: model-id, version: version} (merge ver {active: false})))))

(define-read-only (get-version (model-id uint) (version uint))
  (ok (map-get? model-versions {model-id: model-id, version: version})))
