# ORD Task

## Setup Instructions

### Prerequisites

- Node.js 22+
- React Native development environment
  - Xcode + CocoaPods for iOS
  - Android Studio for Android

### Install and Run

```bash
npm install
cd ios && pod install && cd ..

npm start

npm run ios
npm run android
```

### Environment

Create a .env file in the project root:

```env
API_BASE_URL=https://jsonplaceholder.typicode.com
```

## Project Structure

```text
src/
    api/
        manager/
        services/
    components/
    config/
    constants/
    context/
    hooks/
    interfaces/
    routes/
    screens/
    slices/
    store/
    utils/
```

## Libraries Used

- react-native (CLI app)
- typescript
- @reduxjs/toolkit
- react-redux
- redux-persist
- @react-navigation/native
- @react-navigation/native-stack
- react-native-screens
- react-native-safe-area-context
- react-native-gesture-handler
- axios
- react-native-dotenv
- react-native-svg
- react-native-svg-transformer

## RTK Query Explanation

RTK Query is used for API state, while a Redux slice is used for local/offline-style tasks.

How it is used in this app:

- API setup is done with createApi in the todos service.
- getTodos and getTodoById are query endpoints.
- addTodo, updateTodo, and deleteTodo are mutation endpoints.
- Caching is enabled via RTK Query with keepUnusedDataFor: 60.
- Tags are used so the cache can refresh automatically after mutations.
  - Queries provide Todos tags.
  - Mutations invalidate Todos tags.

In short: when a mutation runs successfully, RTK Query marks related cached data as stale and refetches active queries. This avoids manual refetch logic in most cases.

## Assumptions Made

- JSONPlaceholder is used as a demo backend and does not persist real writes.
- API todos use numeric ids; local tasks use string ids.
- The list shown to the user combines local tasks and API tasks.
- Local tasks are persisted with redux-persist (AsyncStorage).
- Authentication is out of scope for this assignment.
