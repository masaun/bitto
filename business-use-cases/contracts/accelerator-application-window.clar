(define-map windows
  { window-id: uint }
  {
    cohort-id: uint,
    open-date: uint,
    close-date: uint,
    applications-received: uint,
    status: (string-ascii 20)
  }
)

(define-data-var window-nonce uint u0)

(define-public (open-application-window (cohort uint) (open uint) (close uint))
  (let ((window-id (+ (var-get window-nonce) u1)))
    (map-set windows
      { window-id: window-id }
      {
        cohort-id: cohort,
        open-date: open,
        close-date: close,
        applications-received: u0,
        status: "open"
      }
    )
    (var-set window-nonce window-id)
    (ok window-id)
  )
)

(define-public (close-window (window-id uint))
  (match (map-get? windows { window-id: window-id })
    window (ok (map-set windows { window-id: window-id } (merge window { status: "closed" })))
    (err u404)
  )
)

(define-read-only (get-window (window-id uint))
  (map-get? windows { window-id: window-id })
)
