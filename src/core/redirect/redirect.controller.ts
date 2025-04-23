import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from '../url/services/url/url.service';

@Controller('')
export class RedirectController {
  public constructor(private readonly urlService: UrlService) {}

  @Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const targetUrl = await this.urlService.redirect(shortCode);

    return res.redirect(targetUrl);
  }
}
