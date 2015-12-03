module.exports = {
	NAME: "USER",
	join: {
		// [{NAME: String, key: String, keyf: String}]
		'LIST': [{
			NAME: "USER_HAS_LIST",
			key: "USER_ID",
			keyf: "ID"
		}, {
			NAME: "LIST",
			key: "ID",
			keyf: "LIST_ID"
		}]
	},
	where: {
		// {field: String, value: String, decalage: int};
		'RIGHTS': {
			decalage: -1
		}
	}
};