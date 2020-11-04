/**
 * Code written by and belongs to Juan Bernardo Tobar <jbtobar>
 * jbtobar.io@gmail.com
 * @author Juan Bernardo Tobar <jbtobar.io@gmail.com>
 */
/* eslint no-param-reassign: off */
/* eslint no-underscore-dangle: off */
/* eslint @typescript-eslint/naming-convention: off */
import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import {
  // AppThunk,
  RootState,
} from '../../store';
import socket from '../../api';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: {},
    sub: {},
    pm: {},
    status: '',
    authStatus: '',
    alerts: [],
  },
  reducers: {
    pushAlerts: (state, action) => {
      const alerts = action.payload;
      state.alerts = [...state.alerts, ...alerts];
    },
    setAlerts: (state, action) => {
      const alerts = action.payload;
      state.alerts = [...alerts];
    },
    storeReadyUser: (state, action) => {
      const {
        status = '',
        profile = {},
        sub = {},
        pm = {},
        authStatus = '',
        alerts,
      } = action.payload;
      state.profile = profile;
      state.sub = sub;
      state.pm = pm;
      state.authStatus = authStatus;
      state.status = status;
      if (alerts) {
        state.alerts = [...state.alerts, alerts];
      }
    },
    loadReadyAuthStatus: (state, action) => {
      const {
        status = '',
        profile = {},
        sub = {},
        pm = {},
        authStatus = '',
        alerts,
      } = action.payload;
      state.profile = profile;
      state.sub = sub;
      state.pm = pm;
      state.authStatus = authStatus;
      state.status = status;
      if (alerts) {
        state.alerts = [...state.alerts, alerts];
      }
    },
  },
});

const { loadReadyAuthStatus, storeReadyUser } = userSlice.actions;
export const { pushAlerts, setAlerts } = userSlice.actions;
export const selectAuthStatus = (state: RootState) => state.user.authStatus;
export const selectUserId = (state: RootState) => state.user.profile._id;
export const selectUser = (state: RootState) => state.user;
export const selectUserSub = (state: RootState) => state.user.sub;
export const selectAlerts = (state: RootState) => state.user.alerts;

const authStatusFromData = (userData) => {
  const { profile, status } = userData;
  if (profile.email !== profile.emailConfirmed) return 'EMAIL_NOT_CONFIRMED';
  if (status === 'active') return 'ACTIVE';
  return 'NO_PLAN';
};

export const storeUser = (dispatch, res) => {
  const state = {};
  const { user, token, extraData } = res;
  if (token) {
    // console.log('TOKENARRRRYRYRYRYRY');
    localStorage.setItem('@TOKEN', token);
  }

  // console.log('authy loaduser',user._id)
  // socket.emit('join',user._id)
  // socket.on('notification',(res) => {
  //     console.log(res)
  // })

  const { sub, pm, status } = extraData;
  state.profile = user;
  state.sub = sub;
  state.pm = pm;
  state.status = status;
  const authStatus = authStatusFromData({ profile: user, sub, pm, status });
  state.authStatus = authStatus;
  dispatch(storeReadyUser(state));
};

export const loadAuthStatus = (dispatch) => {
  // const dispatch = useDispatch()
  console.log('loadAuthStatus');

  socket.on('authenticated', (res) => {
    // socket.off('unauthorized');
    // socket.off('authenticated');
    socket.isAuth = true
    res.authStatus = 'AUTH';
    res.ok = true;

    const { ok, message, user, extraData } = res;
    const { sub, pm, status } = extraData;

    console.log('authy hererrere', user._id);
    if (!socket._callbacks.$notification) {
      socket.on('notification', (res) => {
        console.log(res);
        dispatch(pushAlerts([res]));
      });
    }
    socket.emit('join', user._id);
    window.socket = socket
    dispatch(
      loadReadyAuthStatus({
        profile: user,
        sub,
        pm,
        status,
        authStatus: authStatusFromData({
          profile: user,
          sub,
          pm,
          status,
        }),
      })
    );
  });
  socket.on('unauthorized', (res) => {
    console.log('unauthorized unauthorized', res);
    dispatch(loadReadyAuthStatus({ authStatus: 'NO_AUTH' }));
  });
  socket.emit('authentication', {});

  if (!socket._callbacks.$connect || socket._callbacks.$connect.length < 2) {
    socket.on('connect',() => {
      socket.emit('authentication', {});
    })
  }
  window.socket = socket;

  // connectSocket(token, null, (res) => {
  //   const state = {};
  //   if (token === null) {
  //     state.authStatus = 'NO_AUTH';
  //   } else {
  //     const { ok, authStatus, message, user, extraData } = res;
  //     // console.log({res})
  //     if (ok) {
  //       const { sub, pm, status } = extraData;
  //       state.profile = user;
  //       state.sub = sub;
  //       state.pm = pm;
  //       state.status = status;
  //       state.authStatus = authStatusFromData({
  //         profile: user,
  //         sub,
  //         pm,
  //         status,
  //       });
  //     } else {
  //       state.authStatus = authStatus;
  //       state.alerts = [message];
  //     }
  //   }
  //   dispatch(loadReadyAuthStatus(state));
  // });
};

export const loadUserFromServer = (dispatch, payload, cb) => {
  const { _id, reloadStripe } = payload;
  socket.emit('find_me', { _id, reloadStripe }, (res) => {
    if (res.ok) {
      const { user, extraData } = res;
      const { sub, pm, status } = extraData;
      const authStatus = authStatusFromData({
        profile: user,
        sub,
        pm,
        status,
      });
      dispatch(
        storeReadyUser({
          profile: user,
          sub,
          pm,
          authStatus,
          status,
        })
      );
    } else alert(res.message);

    cb(res);
  });
};

export default userSlice.reducer;

/*
loadUserFromStorage: (state) => {
  const serializedUser = localStorage.getItem('@USERDATA');
  if (serializedState !== null) {
    const { status, profile, sub, pm } = JSON.parse(serializedUser);
    state = {
      status,
      profile,
      sub,
      pm,
    };
  }
},
setAuthStatus: (state, action) => {
  state.authStatus = action.payload;
},
storeUser: (state, action) => {
  const { profile = {}, pm = {}, sub = {}, status = '' } = action.payload;
  state.profile = profile;
  state.sub = sub;
  state.status = status;
  state.pm = pm;
  localStorage.setItem(
    '@USERDATA',
    JSON.stringify({
      status,
      profile,
      sub,
      pm,
    })
  );
},
*/

// export const selectUser = (state: RootState) => state.user;
// export const selectUserStatus = (state: RootState) => state.user.status;
