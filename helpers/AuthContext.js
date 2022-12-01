import * as React from 'react';
import {useAuth} from './index';


const RESTORE_TOKEN = 'RESTORE_TOKEN';
const SIGN_IN = 'SIGN_IN';
const SIGN_OUT = 'SIGN_OUT';

const initialState = {
    isAuthLoading: true,
    isLoggedIn: false,
    token: null
}

export const AuthContext = React.createContext(initialState);

function authReducer (prevState, action) {
    switch (action.type) {
      case RESTORE_TOKEN:
        return {
          ...prevState,
          token: action.token,
          isLoggedIn: !!action.token ?? false,
          isAuthLoading: false
        };
      case SIGN_IN:
        return {
          ...prevState,
          isLoggedIn: true,
          token: action.token,
        };
      case SIGN_OUT:
        return {
          ...prevState,
          isLoggedIn: false,
          token: null,
        };
    }
}

export default function AuthProvider({ children }) {
    const [state, dispatch] = React.useReducer(
      authReducer,
      initialState
    );

    const { saveAuthToken, getAuthToken } = useAuth();

    React.useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const bootstrapAsync = async () => {
          let userToken;
          try {
            userToken = await getAuthToken();
          } catch (e) {
            // Restoring token failed
          }
          dispatch({ type: RESTORE_TOKEN, token: userToken });
        };
        bootstrapAsync();
    }, []);

    const authContext = React.useMemo(
        () => ({
          signIn: async (token) => {
            saveAuthToken(token);
            dispatch({ type: SIGN_IN, token });
          },
          signOut: () => dispatch({ type: SIGN_OUT }),
        }),
        [state.token]
    );
    
    return (
        <AuthContext.Provider value={{...state, ...authContext}}>
          {children}
        </AuthContext.Provider>
    );
}