```mermaid
flowchart TD
    A[Gateway] -->|verify email| B(User Service)
    B --> C{Check User valid}
    C -->|No| End(End)
    C -->|Yes| D{Is Verify Email exsiting}
    D -->|No| F[Create new Verify Email]
    F --> End

    D -->|Yes| E[Is validate it expire?]
    E -->|No| G[Send the old email again]
    E -->|Yes| H[Update Verify Email validate expire]
    H --> End
    G --> End
```
