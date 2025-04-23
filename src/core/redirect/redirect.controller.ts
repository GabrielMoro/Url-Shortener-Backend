import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from '../url/services/url/url.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('')
export class RedirectController {
  public constructor(private readonly urlService: UrlService) {}

  @ApiOperation({
    summary: 'Redirecionar para a URL original',
    description: 'Redireciona o usuário para a URL original baseada no código curto fornecido.',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Código curto da URL',
    example: 'abc123',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionado para a URL original com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'URL não encontrada ou foi removida.',
  })
  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const targetUrl = await this.urlService.redirect(shortCode);

    return res.redirect(targetUrl);
  }
}
