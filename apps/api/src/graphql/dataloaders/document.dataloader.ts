import DataLoader from 'dataloader';
import { PrismaService } from '../../common/prisma.service';

export class DocumentDataLoader {
  private loader: DataLoader<string, any>;

  constructor(private prisma: PrismaService) {
    this.loader = new DataLoader<string, any>(async (ids: readonly string[]) => {
      const documents = await this.prisma.document.findMany({
        where: {
          id: {
            in: ids as string[],
          },
        },
      });

      const documentMap = new Map(documents.map((doc) => [doc.id, doc]));
      return ids.map((id) => documentMap.get(id) || null);
    });
  }

  load(id: string): Promise<any> {
    return this.loader.load(id);
  }

  loadMany(ids: string[]): Promise<(any | Error)[]> {
    return this.loader.loadMany(ids);
  }
}

