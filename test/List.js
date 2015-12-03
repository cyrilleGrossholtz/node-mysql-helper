module.exports = {
	NAME: "LIST",
	join: {
		// [{NAME: String, key: String, keyf: String}]
		'USER': [{
			NAME: "USER_HAS_LIST",
			key: "LIST_ID",
			keyf: "ID"
		}, {
			NAME: "USER",
			key: "ID",
			keyf: "USER_ID"
		}]
	},
	where: {
		// {field: String, value: String, decalage: int};
		'RIGHTS': {
			decalage: -1
		}
	}
};