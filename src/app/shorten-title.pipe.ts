import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenTitle'
})
export class ShortenTitlePipe implements PipeTransform {

  transform(value: string, limit=15): unknown {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }

}
