export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    status: String!
    profileImage: String
    createdAt: String!
    businessProfile: BusinessProfile
    downloads: [DownloadHistory]
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type FestivalCategory {
    id: ID!
    name: String!
    slug: String!
    description: String
    icon: String
    coverImage: String
    isVisible: Boolean!
    order: Int!
    createdAt: String!
    cards: [FestivalCard]
    cardCount: Int
  }

  type FestivalCard {
    id: ID!
    title: String!
    categoryId: String!
    category: FestivalCategory
    thumbnail: String!
    highResImage: String!
    primaryColor: String!
    secondaryColor: String!
    status: String!
    downloadCount: Int!
    viewCount: Int!
    isTrending: Boolean!
    isFeatured: Boolean!
    tags: [String]
    logoX: Float!
    logoY: Float!
    logoWidth: Float!
    logoHeight: Float!
    businessNameX: Float!
    businessNameY: Float!
    businessNameFontSize: Int!
    businessNameColor: String!
    phoneX: Float!
    phoneY: Float!
    phoneColor: String!
    emailX: Float!
    emailY: Float!
    emailColor: String!
    websiteX: Float!
    websiteY: Float!
    websiteColor: String!
    addressX: Float!
    addressY: Float!
    addressColor: String!
    taglineX: Float!
    taglineY: Float!
    taglineColor: String!
    fontFamily: String!
    createdAt: String!
  }

  type BusinessProfile {
    id: ID!
    userId: String!
    businessName: String
    ownerName: String
    phone: String
    email: String
    website: String
    address: String
    instagram: String
    facebook: String
    whatsapp: String
    tagline: String
    gstNumber: String
    logo: String
  }

  type DownloadHistory {
    id: ID!
    userId: String!
    cardId: String!
    card: FestivalCard
    format: String!
    createdAt: String!
  }

  type DashboardStats {
    totalUsers: Int!
    totalCards: Int!
    totalDownloads: Int!
    totalCategories: Int!
    recentUsers: [User]
    recentCards: [FestivalCard]
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CategoryInput {
    name: String!
    description: String
    icon: String
    coverImage: String
    isVisible: Boolean
    order: Int
  }

  input FestivalCardInput {
    title: String!
    categoryId: String!
    thumbnail: String!
    highResImage: String!
    primaryColor: String
    secondaryColor: String
    status: String
    tags: [String]
    logoX: Float
    logoY: Float
    logoWidth: Float
    logoHeight: Float
    businessNameX: Float
    businessNameY: Float
    businessNameFontSize: Int
    businessNameColor: String
    phoneX: Float
    phoneY: Float
    phoneColor: String
    emailX: Float
    emailY: Float
    emailColor: String
    websiteX: Float
    websiteY: Float
    websiteColor: String
    addressX: Float
    addressY: Float
    addressColor: String
    taglineX: Float
    taglineY: Float
    taglineColor: String
    fontFamily: String
    isTrending: Boolean   # ← added
  isFeatured: Boolean   # ← added
  }

  input BusinessProfileInput {
    businessName: String
    ownerName: String
    phone: String
    email: String
    website: String
    address: String
    instagram: String
    facebook: String
    whatsapp: String
    tagline: String
    gstNumber: String
    logo: String
  }

  type Query {
    me: User
    users(page: Int, limit: Int, search: String): [User]
    user(id: ID!): User
    categories(includeHidden: Boolean): [FestivalCategory]
    category(id: ID!): FestivalCategory
    festivalCards(
      categoryId: String
      status: String
      search: String
      filter: String
      page: Int
      limit: Int
    ): [FestivalCard]
    festivalCard(id: ID!): FestivalCard
    dashboardStats: DashboardStats
    myDownloads: [DownloadHistory]
    myBusinessProfile: BusinessProfile
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    
    createCategory(input: CategoryInput!): FestivalCategory!
    updateCategory(id: ID!, input: CategoryInput!): FestivalCategory!
    deleteCategory(id: ID!): DeleteResponse!
    toggleCategoryVisibility(id: ID!): FestivalCategory!
    
    createFestivalCard(input: FestivalCardInput!): FestivalCard!
    updateFestivalCard(id: ID!, input: FestivalCardInput!): FestivalCard!
    deleteFestivalCard(id: ID!): DeleteResponse!
    publishFestivalCard(id: ID!): FestivalCard!
    unpublishFestivalCard(id: ID!): FestivalCard!
    
    saveBusinessProfile(input: BusinessProfileInput!): BusinessProfile!
    recordDownload(cardId: ID!, format: String!): DownloadHistory!
    
    updateUserStatus(id: ID!, status: String!): User!
    deleteUser(id: ID!): DeleteResponse!
    updateProfile(name: String, profileImage: String): User!
  }
`;
