import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountDto } from '../../generated';

interface State {
  account: AccountDto | undefined;
  accessToken: string | undefined;
}

const initialState: State = {
  account: undefined,
  accessToken: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedAccount: (state, action: PayloadAction<AccountDto | undefined>) => {
      state.account = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | undefined>) => {
      state.accessToken = action.payload;
    },
    clearAuth: () => initialState,
  },
});

export const { setAuthenticatedAccount, setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;