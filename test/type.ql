post {
	id: number;
	title: string;
	body: string;
	userId: number;
	user = user#(this.userId);
	comments = ::comments where postId=this post.id;
}
comment {
	id: number;
	name: string;
	email: string;
	body: string;
	postId: number;
	post = post#(this.postId);
}
album {
	id: number;
	title: string;
	userId: number;
	user = user#(this.userId);
	photos = ::photos where albumId=this album.id;
}
photo {
	id: number;
	title: string;
	url: string;
	thumbnailUrl: string;
	albumId: number;
	album = album#(this.albumId);
}
user {
	id: number;
	name: string;
	email: string;
	posts = ::posts where userId=this user.id;
	albums = ::albums where userId=this user.id;
	todos = ::todos where userId=this user.id;
}
todo {
	id: number;
	title: string;
	completed: boolean;
	userId: number;
	user = user#(this.userId);
}