export const TODO_ORDER_BY = [
  { name: "Most Popular", value: "most_popular" },
  { name: "Lowest Price", value: "lowest_price" },
  { name: "Highest Price", value: "highest_price" },
  { name: "Highest Rating", value: "highest_rating" },
  { name: "Newly Added", value: "newest" }
] as const

export const BOOKING_ORDER_BY = [
  { name: "Newest", value: "desc" },
  { name: "Oldest", value: "asc" }
] as const

export const TODO_REVIEW_ORDER_BY = [
  { name: "Latest Review", value: "latest" },
  { name: "Most Helpful", value: "most_helpful" },
  { name: "Rating (High to Low)", value: "desc" },
  { name: "Rating (Low to High)", value: "asc" }
] as const

export const PARTNER_ORDER_BY = [
  { name: "Newly Created", value: "latest" },
  { name: "A to Z", value: "asc" },
  { name: "Z to A", value: "desc" }
] as const