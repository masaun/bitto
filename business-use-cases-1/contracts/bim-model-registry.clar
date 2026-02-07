(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map bim-models
  { model-id: uint }
  {
    project-id: uint,
    model-hash: (buff 32),
    version: uint,
    uploaded-at: uint
  }
)

(define-data-var model-nonce uint u0)

(define-public (upload-bim-model (project-id uint) (model-hash (buff 32)) (version uint))
  (let ((model-id (+ (var-get model-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set bim-models { model-id: model-id }
      {
        project-id: project-id,
        model-hash: model-hash,
        version: version,
        uploaded-at: stacks-block-height
      }
    )
    (var-set model-nonce model-id)
    (ok model-id)
  )
)

(define-read-only (get-bim-model (model-id uint))
  (ok (map-get? bim-models { model-id: model-id }))
)

(define-read-only (get-model-count)
  (ok (var-get model-nonce))
)
