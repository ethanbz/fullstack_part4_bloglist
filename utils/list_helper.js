const dummy = blogs => {
	return 1
}

const totalLikes = blogs => {
	const reducer = (sum, item) => sum + item
	return blogs.map(blog => blog.likes).reduce(reducer, 0)
}

const favoriteBlog = blogs => {
	let favBlog = blogs[0]
	blogs.forEach(blog => {if (blog.likes > favBlog.likes) favBlog = blog} )
	return favBlog
}

const mostBlogs = blogs => {
	const authorRank = {}

	blogs.forEach(blog => {
		authorRank[blog.author] === undefined ? authorRank[blog.author] = 1 : authorRank[blog.author] += 1
	})

	let bestRank = -1
	let bestAuthor = null
	for (author in authorRank) {
		if (authorRank[author] > bestRank) {
			bestRank = authorRank[author]
			bestAuthor = author
		}
	}
	return { author: bestAuthor, blogs: bestRank }

}

const mostLikes = blogs => {
	const authorRank = {}

	blogs.forEach(blog => {
		authorRank[blog.author] === undefined ? authorRank[blog.author] = blog.likes : authorRank[blog.author] += blog.likes
	})

	let bestRank = -1
	let bestAuthor = null
	for (author in authorRank) {
		if (authorRank[author] > bestRank) {
			bestRank = authorRank[author]
			bestAuthor = author
		}
	}
	return { author: bestAuthor, likes: bestRank }
}

module.exports = {
	dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}