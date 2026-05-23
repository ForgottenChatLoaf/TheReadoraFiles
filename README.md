# Readora

A front-end e-commerce bookstore website built as a school project. Readora lets users browse over 1,200 book titles across multiple genres, explore a stationery catalogue, and simulate a full shopping experience — from product discovery through to mock checkout.

Live site: [readoraupdate.netlify.app](https://readoraupdate.netlify.app/)

---

## Features

- Book catalogue with filtering by genre, price range, rating, and availability
- Stationery section covering journals, planners, pens, art supplies, and more
- Shopping cart with promo code support
- Mock checkout flow (no real transactions are processed)
- User account UI with login, sign-up, and order history views
- Wishlist with session persistence
- Customer reviews and ratings per product
- Dark mode and personalisation settings (font size, accent colour, language, currency)
- Responsive layout for desktop and mobile

---

## Pages

| Path | Description |
|---|---|
| `/` | Homepage — hero, featured books, categories, reviews |
| `/frontend/pages/stationery` | Stationery catalogue |
| `/frontend/pages/refund` | Returns and refund policy |

---

## Tech Stack

This is a static front-end project with no back-end or database.

- HTML, CSS, JavaScript
- Hosted on Netlify

---

## Project Structure

```
/
├── index.html
├── .gitignore
├── FrontEnd/
│   ├── BooksImage/        # Book cover assets
│   ├── pages/
│   │   ├── stationery/    # Stationery page
│   │   └── refund/        # Refund policy page
│   ├── css/
│   └── js/
```

> Note: Adjust the structure above to match your actual folder layout.

---

## Getting Started

No build step is required. Clone the repo and open `index.html` directly in a browser, or serve it with any static file server.

```bash
git clone https://github.com/your-username/readora.git
cd readora
# Open index.html in your browser, or:
npx serve .
```

---

## Team

**404 Team Name Not Found** — school project group.

| Name | Role |
|---|---|
| Ethan McClarence P. Gacud | Team Leader & Lead Developer |
| John Paul Caalim | Information Architect |
| Josh Raphael Gargalicana | Content Manager |
| Gian G. Mangulabnan | UX & UI Designer |

---

## Notes

- Checkout, login, and account features are mock UI only. No real orders are placed and no user data is stored.
- All prices are displayed in Philippine Peso (PHP).
- Contact: readora@example.com

---

## License

This project was made for academic purposes. All book cover images and brand assets are used for demonstration only.
