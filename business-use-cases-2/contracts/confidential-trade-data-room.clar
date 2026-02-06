(define-map data-rooms uint {
  room-name: (string-utf8 256),
  owner: principal,
  creation-date: uint,
  access-control: (string-ascii 20),
  status: (string-ascii 20)
})

(define-map room-participants { room-id: uint, participant: principal } bool)

(define-data-var room-counter uint u0)

(define-read-only (get-data-room (room-id uint))
  (map-get? data-rooms room-id))

(define-read-only (is-participant (room-id uint) (participant principal))
  (default-to false (map-get? room-participants { room-id: room-id, participant: participant })))

(define-public (create-data-room (room-name (string-utf8 256)) (access-control (string-ascii 20)))
  (let ((new-id (+ (var-get room-counter) u1)))
    (map-set data-rooms new-id {
      room-name: room-name,
      owner: tx-sender,
      creation-date: stacks-block-height,
      access-control: access-control,
      status: "active"
    })
    (var-set room-counter new-id)
    (ok new-id)))

(define-public (add-participant (room-id uint) (participant principal))
  (begin
    (asserts! (is-some (map-get? data-rooms room-id)) (err u2))
    (let ((room (unwrap-panic (map-get? data-rooms room-id))))
      (asserts! (is-eq tx-sender (get owner room)) (err u1))
      (ok (map-set room-participants { room-id: room-id, participant: participant } true)))))
