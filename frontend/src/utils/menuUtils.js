export const filterMenuByRole = (menu, role) => {
  return menu
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((c) =>
          c.roles.includes(role)
        );

        return { ...item, children };
      }

      return item;
    })
    .filter(
      (item) => !item.children || item.children.length > 0
    );
};
