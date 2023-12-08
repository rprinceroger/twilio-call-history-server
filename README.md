# Instruction how to test in POSTMAN:

> GET /fetch-call-history

```
http://localhost:5000/fetch-call-history?startDate=2023-01-01T00:00:00Z&endDate=2023-02-15T23:59:59Z
```

```json
{
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-02-15T23:59:59Z"
}
```

> POST /export-to-excel

```
http://localhost:5000/export-to-excel
```

```json
{
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-02-15T23:59:59Z"
}
```