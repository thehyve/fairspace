const styles = theme => ({
    menuItemList: {
        '& .active, & .active:hover': {
            backgroundColor: theme.palette.action.selected
        }
    }
});

export default styles;
