(define-map sessions
  { session-id: uint }
  {
    matching-id: uint,
    session-date: uint,
    duration: uint,
    topics: (string-ascii 200),
    notes: (string-ascii 500),
    logged-at: uint
  }
)

(define-data-var session-nonce uint u0)

(define-public (log-session (matching uint) (session-date uint) (duration uint) (topics (string-ascii 200)) (notes (string-ascii 500)))
  (let ((session-id (+ (var-get session-nonce) u1)))
    (map-set sessions
      { session-id: session-id }
      {
        matching-id: matching,
        session-date: session-date,
        duration: duration,
        topics: topics,
        notes: notes,
        logged-at: stacks-block-height
      }
    )
    (var-set session-nonce session-id)
    (ok session-id)
  )
)

(define-read-only (get-session (session-id uint))
  (map-get? sessions { session-id: session-id })
)
