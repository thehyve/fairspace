const styles = () => ({
    uploadMenu: {
        '& .MuiList-padding': {
            paddingBottom: 0
        },
        '& .MuiListItem-root': {
            paddingTop: 4,
            paddingBottom: 4
        },
        '& .MuiDivider-root': {
            marginTop: 2,
            marginBottom: 0
        }
    },
    uploadMenuHelper: {
        borderLeft: '8px solid #999',
        padding: '5px 10px 5px 10px'
    },
    uploadMenuHelperText: {
        margin: 0,
        cursor: 'default'
    }
});

export default styles;
