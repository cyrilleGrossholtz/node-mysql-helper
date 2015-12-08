module.exports = {
	NAME: "LIST",
	identifier : "ID", // will resolve to default if not defined
	select: {
		NAME: "nameOfTheList"
	},
	join: {
		// [{NAME: String, key: String, keyf: String}]
		USER: [{
			NAME: "USER_HAS_LIST",
			keyf: "ID",
			key: "LIST_ID",
			identifier : "ID"
		}, {
			NAME: "USER",
			keyf: "USER_ID",
			key: "ID",
			select:{
				ID: "identifier"
			}
		}]
	},
	where: {
		// {field: String, value: String, decalage: int};
		RIGHTS: {
			decalage: "parent"
		}
	}
};