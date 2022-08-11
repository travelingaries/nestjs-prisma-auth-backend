import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async getAllUsers() {
		return await this.prisma.user.findMany({
			select: {
				email: true,
				nickname: true,
			},
		});
	}

	async getUserById(id: string, currentUserId?: string) {
		let query;
		if (currentUserId && id == currentUserId) {
			query = {
				id: true,
				email: true,
				nickname: true,
				name: true,
				phoneNumber: true,
			}
		} else {
			query = {
				email: true,
				nickname: true,
			}
		}

		const user = await this.prisma.user.findUnique({
    		where: {
        		id: id,
    		},
    		select: query,
    	});
    	if (!user) {
    		throw new HttpException("user not found", HttpStatus.NOT_FOUND);
    	}

    	return user;
	}
}