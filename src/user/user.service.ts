import { ForbiddenException, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as process from 'process';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user';
import { DataSource, Repository } from 'typeorm';
import { UserTag } from '../entities/user.tag';
import { v1 as uuidv1 } from 'uuid';
import { google } from 'googleapis';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserTag)
    private readonly userTagRepository: Repository<UserTag>,
    private readonly jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async getTags(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        tags: true,
      },
    });
    if (user) {
      return { tags: user.tags.map((tag) => tag.tag) };
    }
  }
  async updateTags(id: string, tags: string[]): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      await this.dataSource.transaction(async (tem) => {
        await tem
          .createQueryBuilder(UserTag, 'userTag')
          .where('userPk = :userPk', { userPk: id })
          .delete()
          .execute();
        await tem
          .createQueryBuilder(UserTag, 'userTag')
          .insert()
          .into(UserTag)
          .values(
            tags.map((value) => {
              return { pk: uuidv1(), tag: value, userPk: id };
            }),
          )
          .execute();
      });
    }
  }

  async updateTitleHeader(id: string, txt: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      await this.userRepository.update(id, {
        titleHeader: txt,
      });
    }
  }

  async getTitleHeader(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      return {
        titleHeader: user.titleHeader ?? '',
      };
    }
  }

  async updateDescriptionHeader(id: string, txt: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      await this.userRepository.update(id, {
        descriptionHeader: txt,
      });
    }
  }

  async getDescriptionHeader(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      return {
        descriptionHeader: user.descriptionHeader ?? '',
      };
    }
  }

  async updateYoutubeApiKey(id: string, key: string): Promise<any> {
    await this.userRepository.update(id, { youtubeApiKey: key });
  }

  async getAccessToken(id: string, accessToken: string): Promise<any> {
    const data = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const pk = data.data.sub;
    if (pk === id) {
      return this.jwtService.sign(
        {
          userPk: id,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '5m',
        },
      );
    } else {
      throw new ForbiddenException();
    }
  }

  async getRefreshToken(accessToken: string): Promise<any> {
    const data = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (data.data) {
      const pk = data.data.sub;
      const user = await this.userRepository.findOne({
        where: {
          id: pk,
        },
      });
      if (!user) {
        // if server doesn't have id, then make one.
        await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({
            id: pk,
            youtubeApiKey: '',
            titleHeader: '',
            descriptionHeader: '',
          })
          .execute();
      }

      return this.jwtService.sign(
        {
          userPk: pk,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );
    }
  }
}
