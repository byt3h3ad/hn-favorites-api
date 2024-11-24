# HN Favs API

A lightweight API to fetch and cache Hacker News favorites (stories or comments) for any user.

## Features

- Retrieve a user's favorite **stories** or **comments** from Hacker News.
- Handles pagination and retries with quadratic backoff.
- Caches responses for 24 hours to improve performance and reduce server load.
- Built with [Hono](https://hono.dev) and [Cheerio](https://cheerio.js.org) for fast and efficient processing.

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/byt3h3ad/hn-favorites-api
   cd hn-favorites-api
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the application:
   ```bash
   pnpm dev
   ```

---

## Endpoints

### 1. **Fetch User's Favorites**

- **Stories**:  
  `GET /:username/stories`
- **Comments**:  
  `GET /:username/comments`

**Example**:

```bash
curl curl https://hn-favs.byt3h3ad.workers.dev/byt3h3ad/stories
```

### 2. **Delete Cached Response**

- `GET /:username/:type/delete-cache`

**Example**:

```bash
curl curl https://hn-favs.byt3h3ad.workers.dev/byt3h3ad/stories/delete-cache
```

---

## Response Format

### **Stories**

```json
[
  {
    "id": 42214331,
    "title": "What made Dostoevsky's work immortalwyounas.com",
    "url": "https://thoughts.wyounas.com/p/what-made-dostoevsky-immortal",
    "hnUrl": "https://news.ycombinator.com/item?id=42214331",
    "type": "story"
  }
]
```

### **Comments**

```json
[
  {
    "id": 22446090,
    "url": "https://news.ycombinator.com/item?id=22446090",
    "user": "bori5",
    "type": "comment"
  }
]
```
