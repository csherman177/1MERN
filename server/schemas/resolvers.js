const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

// resolvers fetch data for a specific field. graphQL functionality.

// get a single user by either their id or their username
const resolvers = {
  Query: {
    user: async (parent, { id, username }) => {
      let user;

      if (id) {
        user = await User.findById(id).populate("savedBooks");
      } else if (username) {
        user = await User.findOne({ username }).populate("savedBooks");
      } else {
        throw new Error("No Matching Username.");
      }

      return user;
    },
  },

  Mutation: {
    // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    saveBook: async (parent, { title, authors, description }, context) => {
      if (context.user) {
        const book = await Book.create({
          title,
          authors,
          description,
        });

        return book;
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    // remove a book from `savedBooks`
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        try {
          // Find the user who is logged in
          const user = await User.findOne({ _id: context.user._id });

          // Check if the book with the given bookId is in the user's savedBooks array
          const bookIndex = user.savedBooks.findIndex(
            (book) => book.bookId === bookId
          );

          if (bookIndex !== -1) {
            // If the book is found, remove it from the savedBooks array
            user.savedBooks.splice(bookIndex, 1);

            // Save the updated user object to the database
            await user.save();

            // Return the removed book
            return { message: "Book removed successfully." };
          } else {
            // If the book is not found in the savedBooks array, throw an error
            throw new Error("Book not found in the savedBooks.");
          }
        } catch (error) {
          throw new Error("Failed to remove the book from savedBooks.");
        }
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
