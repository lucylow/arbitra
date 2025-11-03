export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'health' : IDL.Func([], [IDL.Text], ['query']) });
};
export const init = ({ IDL }) => { return []; };
