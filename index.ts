import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import routes from '../../constants/routes.json';

const terminalSlice = createSlice({
  name: 'terminal',
  initialState: {
    tabs: [
      {
        name: 'home',
        pathname: routes.TERMINAL,
        data: [],
      },
    ],
    activeTab: 0,
  },
  reducers: {
    setRoute: (state, action) => {
      const pathname = action.payload;
      const arr = pathname.match(/\/terminal\/(.*)/);
      if (arr != null || pathname === routes.TERMINAL) {
        const copyTabs = [...state.tabs];
        if (arr != null) {
          const [p, name] = arr;
          copyTabs[state.activeTab].name = name;
        } else {
          copyTabs[state.activeTab].name = 'home';
        }
        copyTabs[state.activeTab].pathname = pathname;
      }
    },
    storeData: (state, action) => {
      const copyTabs = [...state.tabs];
      copyTabs[state.activeTab].data = action.payload;
    },
    destroyTab: (state, action) => {
      if (state.tabs.length > 1) {
        const tabIndex = action.payload;
        const copyTabs = [...state.tabs];
        copyTabs.splice(tabIndex, 1);
        if (tabIndex <= state.activeTab) {
          state.activeTab -= 1;
        }
        state.tabs = copyTabs;
      }
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    newTab: (state) => {
      const { activeTab } = state;
      state.tabs = [...state.tabs, state.tabs[activeTab]];
      state.activeTab = activeTab + 1;
      // state.data = [];
    },
  },
});
//
export const {
  storeData,
  newTab,
  destroyTab,
  setRoute,
  setActiveTab,
} = terminalSlice.actions;
//
export default terminalSlice.reducer;
//
export const selectData = (state: RootState) =>
  state.terminal.tabs[state.terminal.activeTab].data;
export const activeTab = (state: RootState) => state.terminal.activeTab;
export const displayTabs = (state: RootState) =>
  state.terminal.tabs.map((d) => ({ name: d.name, pathname: d.pathname }));
