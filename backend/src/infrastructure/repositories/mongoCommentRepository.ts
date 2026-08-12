import { Collection, Db, ObjectId } from "mongodb";
import {
  Comment,
  CommentRepository,
  NewComment,
} from "../../domain/ports/comment/commentRepository";
import { CommentNotFoundError } from "../../application/useCases/comment/errors";

interface CommentDocument {
  _id: string;
  description: string;
  createdOn: Date;
  userId: string;
  beachId: string;
}

export class MongoCommentRepository implements CommentRepository {
  private readonly collection: Collection<CommentDocument>;

  constructor(db: Db) {
    this.collection = db.collection<CommentDocument>("comments");
  }
  async addComment(
    comment: NewComment,
    beachId: string,
    commenterId: string,
  ): Promise<Comment> {
    const id = new ObjectId().toHexString();
    await this.collection.insertOne({
      _id: id,
      description: comment.description,
      createdOn: comment.createdOn,
      userId: commenterId,
      beachId,
    });
    return {
      id,
      description: comment.description,
      createdOn: comment.createdOn,
      userId: commenterId,
      beachId,
    };
  }

  async listCommentsForBeach(beachId: string): Promise<Comment[] | []> {
    const docs = await this.collection
      .find({ beachId })
      .sort({ createdOn: -1 })
      .toArray();

    return docs.map(doc => ({
      id: doc._id,
      description: doc.description,
      createdOn: doc.createdOn,
      userId: doc.userId,
      beachId: doc.beachId,
    }));
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.collection.deleteOne({ _id: commentId });
  }
  async getCommentById(commentId: string): Promise<Comment> {
    const comment = await this.collection.findOne({ _id: commentId });
    if (!comment) throw new CommentNotFoundError();
    return {
      id: comment._id,
      description: comment.description,
      createdOn: comment.createdOn,
      userId: comment.userId,
      beachId: comment.beachId,
    };
  }
}
