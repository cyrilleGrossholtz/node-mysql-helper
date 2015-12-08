module.exports = {
	NAME: "USER",
	identifier : "ID",
	select: {
		USERNAME: "nameOfTheUser",
		PASSWORD: false
	},
	join: {
		// [{NAME: String, key: String, keyf: String}]
		LIST: [{
			NAME: "USER_HAS_LIST",
			keyf: "ID",
			key: "USER_ID",
			identifier : "ID",
			select: {
				RIGHTS: "level"
			}
		}, {
			NAME: "LIST",
			keyf: "LIST_ID",
			key: "ID"
		}],
		AVATAR: [{
			NAME: "AVATAR",
			keyf: "AVATAR_ID",
			key: "ID"
		}]
	},
	where: {
		// {field: String, value: String, decalage: int};
		RIGHTS: {
			decalage: "parent"
		}
	}
};