(define-map disputes uint {
  claimant: principal,
  respondent: principal,
  dispute-type: (string-ascii 50),
  description: (string-utf8 512),
  filing-date: uint,
  arbitrator: principal,
  ruling: (string-ascii 20),
  status: (string-ascii 20)
})

(define-data-var dispute-counter uint u0)

(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes dispute-id))

(define-public (file-dispute (respondent principal) (dispute-type (string-ascii 50)) (description (string-utf8 512)))
  (let ((new-id (+ (var-get dispute-counter) u1)))
    (map-set disputes new-id {
      claimant: tx-sender,
      respondent: respondent,
      dispute-type: dispute-type,
      description: description,
      filing-date: stacks-block-height,
      arbitrator: tx-sender,
      ruling: "pending",
      status: "filed"
    })
    (var-set dispute-counter new-id)
    (ok new-id)))

(define-public (assign-arbitrator (dispute-id uint) (arbitrator principal))
  (begin
    (asserts! (is-some (map-get? disputes dispute-id)) (err u1))
    (ok (map-set disputes dispute-id (merge (unwrap-panic (map-get? disputes dispute-id)) { 
      arbitrator: arbitrator,
      status: "in-arbitration"
    })))))

(define-public (issue-ruling (dispute-id uint) (ruling (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? disputes dispute-id)) (err u2))
    (let ((dispute (unwrap-panic (map-get? disputes dispute-id))))
      (asserts! (is-eq tx-sender (get arbitrator dispute)) (err u1))
      (ok (map-set disputes dispute-id (merge dispute { 
        ruling: ruling,
        status: "resolved"
      }))))))
