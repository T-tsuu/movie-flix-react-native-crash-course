// track the searches made by a user

import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!

/* console.log({
  DATABASE_ID,
  COLLECTION_ID,
  ENDPOINT,
  PROJECT_ID
}) */

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        if (!query || !movie) return;
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query)
        ])

        // check if a record of that search ha already been stored
        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, existingMovie.$id, {
                count: existingMovie.count + 1
            })
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                count: 1,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            })
        }
    } catch (error) {
        console.log(error);
        throw error
    }
    // if a document is found increment the searchCount field

    // if no document is found
    // create a new document in Appwrite databese ->

}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        // Fetch more than 5 to ensure we have enough after filtering
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(20), 
            Query.orderDesc('count'),
        ]);

        const documents = result.documents as unknown as TrendingMovie[];

        // Use a Map to keep only the first instance of each movie ID/Title
        const uniqueMoviesMap = new Map();

        for (const movie of documents) {
            // Replace 'movie_id' with whatever field identifies the movie (e.g., tmdb_id)
            if (!uniqueMoviesMap.has(movie.movie_id)) {
                uniqueMoviesMap.set(movie.movie_id, movie);
            }
            
            // Stop once we have 5 unique items
            if (uniqueMoviesMap.size === 5) break;
        }

        return Array.from(uniqueMoviesMap.values());
    } catch (error) {
        console.log(error);
        return undefined;
    }
}