import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
        profileImage
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      status
      profileImage
      businessProfile {
        id
        businessName
        ownerName
        phone
        email
        website
        address
        instagram
        facebook
        whatsapp
        tagline
        gstNumber
        logo
      }
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories($includeHidden: Boolean) {
    categories(includeHidden: $includeHidden) {
      id
      name
      slug
      description
      icon
      coverImage
      isVisible
      order
      createdAt
      cardCount
    }
  }
`;

export const FESTIVAL_CARDS_QUERY = gql`
  query FestivalCards($categoryId: String, $status: String, $search: String, $filter: String, $page: Int, $limit: Int) {
    festivalCards(categoryId: $categoryId, status: $status, search: $search, filter: $filter, page: $page, limit: $limit) {
      id
      title
      festivalDate
      thumbnail
      highResImage
      primaryColor
      secondaryColor
      status
      downloadCount
      viewCount
      isTrending
      isFeatured
      tags
      createdAt
      category {
        id
        name
        slug
      }
    }
  }
`;

export const FESTIVAL_CARD_QUERY = gql`
  query FestivalCard($id: ID!) {
    festivalCard(id: $id) {
      id
      title
      festivalDate
      thumbnail
      highResImage
      primaryColor
      secondaryColor
      status
      downloadCount
      viewCount
      isTrending
      isFeatured
      tags
      logoX
      logoY
      logoWidth
      logoHeight
      businessNameX
      businessNameY
      businessNameFontSize
      businessNameColor
      phoneX
      phoneY
      phoneColor
      emailX
      emailY
      emailColor
      websiteX
      websiteY
      websiteColor
      addressX
      addressY
      addressColor
      taglineX
      taglineY
      taglineColor
      fontFamily
      createdAt
      category {
        id
        name
        slug
      }
    }
  }
`;

export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalUsers
      totalCards
      totalDownloads
      totalCategories
      recentUsers {
        id
        name
        email
        createdAt
        status
      }
      recentCards {
        id
        title
        thumbnail
        status
        downloadCount
        createdAt
        category {
          name
        }
      }
    }
  }
`;

export const USERS_QUERY = gql`
  query Users($page: Int, $limit: Int, $search: String) {
    users(page: $page, limit: $limit, search: $search) {
      id
      name
      email
      role
      status
      profileImage
      createdAt
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      description
      icon
      isVisible
      order
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      icon
      isVisible
      order
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`;

export const TOGGLE_CATEGORY_VISIBILITY_MUTATION = gql`
  mutation ToggleCategoryVisibility($id: ID!) {
    toggleCategoryVisibility(id: $id) {
      id
      isVisible
    }
  }
`;

export const CREATE_FESTIVAL_CARD_MUTATION = gql`
  mutation CreateFestivalCard($input: FestivalCardInput!) {
    createFestivalCard(input: $input) {
      id
      title
      status
      thumbnail
    }
  }
`;

export const UPDATE_FESTIVAL_CARD_MUTATION = gql`
  mutation UpdateFestivalCard($id: ID!, $input: FestivalCardInput!) {
    updateFestivalCard(id: $id, input: $input) {
      id
      title
      status
      thumbnail
    }
  }
`;

export const DELETE_FESTIVAL_CARD_MUTATION = gql`
  mutation DeleteFestivalCard($id: ID!) {
    deleteFestivalCard(id: $id) {
      success
      message
    }
  }
`;

export const PUBLISH_CARD_MUTATION = gql`
  mutation PublishFestivalCard($id: ID!) {
    publishFestivalCard(id: $id) {
      id
      status
    }
  }
`;

export const SAVE_BUSINESS_PROFILE_MUTATION = gql`
  mutation SaveBusinessProfile($input: BusinessProfileInput!) {
    saveBusinessProfile(input: $input) {
      id
      businessName
      ownerName
      phone
      email
      website
      address
      instagram
      facebook
      whatsapp
      tagline
      logo
    }
  }
`;

export const RECORD_DOWNLOAD_MUTATION = gql`
  mutation RecordDownload($cardId: ID!, $format: String!) {
    recordDownload(cardId: $cardId, format: $format) {
      id
      format
      createdAt
    }
  }
`;

export const UPDATE_USER_STATUS_MUTATION = gql`
  mutation UpdateUserStatus($id: ID!, $status: String!) {
    updateUserStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const MY_BUSINESS_PROFILE_QUERY = gql`
  query MyBusinessProfile {
    myBusinessProfile {
      id
      businessName
      ownerName
      phone
      email
      website
      address
      instagram
      facebook
      whatsapp
      tagline
      gstNumber
      logo
    }
  }
`;

export const MY_DOWNLOADS_QUERY = gql`
  query MyDownloads {
    myDownloads {
      id
      format
      createdAt
      card {
        id
        title
        thumbnail
        category {
          name
        }
      }
    }
  }
`;
