# Factorial Calculator API

Calculate factorial of a number.

## Endpoint

### GET `/calculate`

**Parameters:**
- `number` (required): Non-negative integer (0-170)

**Example Request:**
```
http://localhost:3005/calculate?number=5
```

**Example Response:**
```json
{
  "number": 5,
  "factorial": 120
}
```
