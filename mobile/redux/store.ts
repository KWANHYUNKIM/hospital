import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import communityReducer, { CommunityState } from './reducers/communityReducer';
import authReducer, { AuthState } from './reducers/authReducer';

// 루트 상태 타입 정의
export interface RootState {
  community: CommunityState;
  auth: AuthState;
}

// 루트 리듀서 결합
const rootReducer = combineReducers({
  community: communityReducer,
  auth: authReducer
});

// Redux 스토어 생성
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store; 